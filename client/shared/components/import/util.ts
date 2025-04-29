import { useCallback, useEffect, useState } from "react";
import { useDataProvider, useResourceContext } from "react-admin";

export const STATUSES = {
    pending: 'pending',
    success: 'success',
    error: 'error',
};

export const useSavableData = (resource: string, fileName: string, baseData: any[]) => {
    const [data, setData] = useState<any[]>(baseData);
    const [fileId, setFileId] = useState<number>();
    const updateItem = useCallback((index: string, item: any) => {
        data[index] = { ...data[index], ...item };
        setData([...data]);
    }, [data]);
    const saveData = useSaveData(resource, data, fileName, fileId, updateItem, setFileId);

    useEffect(() => { setData(baseData) }, [baseData]);

    return { data, saveData };
}

const useSaveData = (resource: string, data: any[], fileName: string, fileId: number, updateDataItem: (index: string, item: any) => void, setFileId: (fileId: number) => void) => {
    const resourceValue = useResourceContext({ resource });
    const { createItem, updateItem } = useCreateItem(resourceValue);

    const saveData = useCallback(async () => {
        let successCount = 0, errorCount = 0;
        for (const index in data) {
            const item = data[index];
            if (item.id) {
                continue;
            }
            updateDataItem(index, { status: STATUSES.pending });
            try {
                const res = await createItem(item);
                updateDataItem(index, { id: res.data.id, status: STATUSES.success });
                successCount++;
            } catch (e) {
                const errorMessage = (e.body ?? e)?.message ?? 'שגיאה לא ידועה';
                updateDataItem(index, { status: STATUSES.error, error: errorMessage });
                errorCount++;
            }
        }

        const entityIds = data.map(item => item.id).filter(id => id);
        if (entityIds.length) {
            const isFullSuccess = successCount === data.length;
            if (fileId) {
                const dataToUpdate = {
                    id: fileId,
                    entityIds,
                    fullSuccess: isFullSuccess,
                };
                await updateItem(dataToUpdate, 'import_file');
            } else {
                const fileData = {
                    userId: data[0].userId,
                    fileName,
                    fileSource: 'קובץ שהועלה',
                    entityName: resourceValue,
                    entityIds,
                    fullSuccess: isFullSuccess,
                    response: 'נשמר',
                };
                const res = await createItem(fileData, 'import_file');
                setFileId(res.data.id);
            }
        }

        return { successCount, errorCount };
    }, [data, fileId, fileName, resourceValue, createItem, updateItem, updateDataItem, setFileId]);

    return saveData;
}

const useCreateItem = (resource: string) => {
    const dataProvider = useDataProvider();

    const createItem = useCallback(async (item: any, itemResource = resource) => {
        const res = await dataProvider.create(itemResource, { data: item });
        return res;
    }, [dataProvider, resource]);
    const updateItem = useCallback(async (item: any, itemResource = resource) => {
        const res = await dataProvider.update(itemResource, { id: item.id, data: item, previousData: {} });
        return res;
    }, [dataProvider, resource]);

    return { createItem, updateItem };
}
