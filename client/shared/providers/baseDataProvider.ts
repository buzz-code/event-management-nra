import { CondOperator, QueryFilter, QueryJoin, QuerySort, RequestQueryBuilder } from '@nestjsx/crud-request';
import omitBy from 'lodash.omitby';
import { DataProvider, fetchUtils } from 'ra-core';
import { stringify } from 'query-string';
import { GetListParams, RaRecord } from 'react-admin';
import saveAs from 'file-saver';

/**
 * Maps react-admin queries to a nestjsx/crud powered REST API
 *
 * @see https://github.com/nestjsx/crud
 *
 * @example
 *
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import crudProvider from 'ra-data-nestjsx-crud';
 *
 * import { PostList } from './posts';
 *
 * const dataProvider = crudProvider('http://localhost:3000');
 * const App = () => (
 *     <Admin dataProvider={dataProvider}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */

interface ExtendedDataProvider extends DataProvider {
  createMany: (
    resource: string,
    bulk: RaRecord[],
  ) => Promise<RaRecord[]>;
  getCount: (
    resource: string,
    params: GetListParams,
  ) => Promise<Number>;
  export: (
    resource: string,
    params: GetListParams,
    format: string,
    resourceLabel: string,
  ) => Promise<void>;
  exec: (
    resource: string,
    url: string,
    params: fetchUtils.Options
  ) => Promise<any>;
}

const countDiff = (o1: Record<string, any>, o2: Record<string, any>): Record<string, any> =>
  omitBy(o1, (v, k) => o2[k] === v);

const composeFilter = (paramsFilter: any): QueryFilter[] => {
  const flatFilter = fetchUtils.flattenObject(paramsFilter);
  return Object.keys(flatFilter).map((key) => {
    const splitKey = key.split(/\|\||:/)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/gi;

    let field = splitKey[0];
    let ops = splitKey[1];
    if (!ops) {
      if (flatFilter[key] === null) {
        ops = CondOperator.IS_NULL;
      } else if (Array.isArray(flatFilter[key])) {
        ops = CondOperator.IN;
      } else if (typeof flatFilter[key] === 'boolean' || typeof flatFilter[key] === 'number' || (typeof flatFilter[key] === 'string' && (flatFilter[key].match(/^\d+$/)) || flatFilter[key].match(uuidRegex))) {
        ops = CondOperator.EQUALS;
      } else {
        ops = CondOperator.CONTAINS_LOW;
      }
    }

    if (field.startsWith('_') && field.includes('.')) {
      field = field.split(/\.(.+)/)[1];
    }
    return { field, operator: ops, value: flatFilter[key] } as QueryFilter;
  });
};

const composeQueryParams = (queryParams: any = {}): string => {
  return stringify(fetchUtils.flattenObject(queryParams), { skipNull: true });
}

const mergeEncodedQueries = (...encodedQueries) => encodedQueries.map((query) => query).join('&')

const getQueryJoin = (sort: QuerySort, filter: QueryFilter[]): QueryJoin[] => {
  const sortJoin = getSortJoin(sort);
  const filterJoin = getFilterJoin(filter);
  return [...sortJoin, ...filterJoin];
}

const getSortJoin = (sort: QuerySort): QueryJoin[] => {
  if (!sort) {
    return [];
  }

  const sortJoin: QueryJoin[] = [];
  if (sort?.field.includes('.')) {
    const [relation] = sort.field.split('.');
    sortJoin.push({ field: relation });
  }
  return sortJoin;
}

const getFilterJoin = (filter: QueryFilter[]): QueryJoin[] => {
  if (!filter) {
    return [];
  }

  const filterJoin: QueryJoin[] = [];
  filter.forEach(({ field }) => {
    if (field.includes('.')) {
      const [relation] = field.split('.');
      filterJoin.push({ field: relation });
    }
  });
  return filterJoin;
}

const calcFileName = (disposition, filename) => {
  if (disposition) {
    const regex = /attachment; filename="(.+)"/;
    const match = regex.exec(disposition);
    if (match && match.length > 1) {
      return match[1];
    }
  }

  return filename;
}

const saveResponseFile = async ({ json }, filename) => {
  const blob = await fetch(`data:${json.type};base64,${json.data}`).then(res => res.blob());
  return saveAs(blob, calcFileName(json.disposition, filename));
}

export default (apiUrl: string, httpClient = fetchUtils.fetchJson): ExtendedDataProvider => ({
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { q: queryParams, $OR: orFilter, extra, ...filter } = params.filter || {};
    const sort = params.sort as QuerySort;
    const queryFilter = composeFilter(filter);

    const encodedQueryParams = composeQueryParams(queryParams)
    const encodedQueryFilter = RequestQueryBuilder.create({
      filter: queryFilter,
      or: composeFilter(orFilter || {})
    })
      .setLimit(perPage)
      .setPage(page)
      .sortBy(sort)
      .setOffset((page - 1) * perPage)
      .setJoin(getQueryJoin(sort, queryFilter))
      .query();

    const encodedQueryExtra = composeQueryParams({ extra });

    const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter, encodedQueryExtra);

    const url = `${apiUrl}/${resource}?${query}`;

    return httpClient(url).then(({ json }) => ({
      data: json.data,
      total: json.total,
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    const encodedQueryParams = RequestQueryBuilder.create()
      .setFilter({
        field: 'id',
        operator: CondOperator.IN,
        value: `${params.ids}`,
      })
      .query();

    const encodedMetaParams = composeQueryParams(params.meta);

    const query = mergeEncodedQueries(encodedQueryParams, encodedMetaParams);

    const url = `${apiUrl}/${resource}?${query}`;

    return httpClient(url).then(({ json }) => ({ data: json.data || json }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { q: queryParams, extra, ...otherFilters } = params.filter || {}
    const filter: QueryFilter[] = composeFilter(otherFilters);
    const sort = params.sort as QuerySort;

    filter.push({
      field: params.target,
      operator: CondOperator.EQUALS,
      value: params.id,
    });

    const encodedQueryParams = composeQueryParams(queryParams)
    const encodedQueryFilter = RequestQueryBuilder.create({
      filter
    })
      .sortBy(sort)
      .setLimit(perPage)
      .setOffset((page - 1) * perPage)
      .setJoin(getQueryJoin(sort, filter))
      .query();

    const encodedQueryExtra = composeQueryParams({ extra });

    const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter, encodedQueryExtra);

    const url = `${apiUrl}/${resource}?${query}`;

    return httpClient(url).then(({ json }) => ({
      data: json.data,
      total: json.total,
    }));
  },

  update: (resource, params) => {
    // no need to send all fields, only updated fields are enough
    const data = countDiff(params.data, params.previousData);
    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        }),
      ),
    ).then((responses) => ({
      data: responses.map(({ json }) => json),
    })),

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id } as any,
    })),

  createMany: (resource, bulk) =>
    httpClient(`${apiUrl}/${resource}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ bulk }),
    }).then(({ json }) => json),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: { ...json, id: params.id } })),

  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: 'DELETE',
        }),
      ),
    ).then((responses) => ({ data: responses.map(({ json }) => json) })),

  getCount: (resource, params) => {
    const { q: queryParams, $OR: orFilter, extra, ...filter } = params.filter || {};
    const sort = params.sort as QuerySort;
    const queryFilter = composeFilter(filter);

    const encodedQueryParams = composeQueryParams(queryParams)
    const encodedQueryFilter = RequestQueryBuilder.create({
      filter: queryFilter,
      or: composeFilter(orFilter || {})
    })
      .sortBy(sort)
      .setJoin(getQueryJoin(sort, queryFilter))
      .query();

    const encodedQueryExtra = composeQueryParams({ extra });

    const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter, encodedQueryExtra);

    const url = `${apiUrl}/${resource}/get-count?${query}`;

    return httpClient(url).then(({ json }) => json.count);
  },

  export: (resource, params, format, resourceLabel) => {
    const { page, perPage } = params.pagination;
    const { q: queryParams, $OR: orFilter, extra, ...filter } = params.filter || {};
    const sort = params.sort as QuerySort;
    const queryFilter = composeFilter(filter);

    const encodedQueryParams = composeQueryParams(queryParams)
    const encodedQueryFilter = RequestQueryBuilder.create({
      filter: queryFilter,
      or: composeFilter(orFilter || {})
    })
      .setLimit(perPage)
      .setPage(page)
      .sortBy(sort)
      .setOffset((page - 1) * perPage)
      .setJoin(getQueryJoin(sort, queryFilter))
      .query();

    const encodedQueryExtra = composeQueryParams({ extra });

    const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter, encodedQueryExtra);

    const url = `${apiUrl}/${resource}/export?extra.format=${format}&${query}`;

    const timestamp = new Date().toISOString();
    const extensionMap = {
      excel: 'xlsx',
      pdf: 'pdf',
      json: 'json',
    }
    const extension = extensionMap[format];
    const filename = `${resourceLabel}-${timestamp}.${extension}`;

    return httpClient(url)
      .then(res => saveResponseFile(res, filename));
  },

  exec: (resource, url, params) =>
    httpClient(`${apiUrl}/${resource}/${url}`, params),

  execAndDownload: (resource, url, params, filename) =>
    httpClient(`${apiUrl}/${resource}/${url}`, params)
      .then(res => saveResponseFile(res, filename)),
});