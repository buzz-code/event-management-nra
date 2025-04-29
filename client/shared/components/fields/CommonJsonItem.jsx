import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { JsonField, JsonInput } from "react-admin-json-view";

const reactJsonEditOptions = {
    name: null,
    style: {
        direction: 'ltr',
        textAlign: 'left',
    },
};
const reactJsonViewOptions = {
    ...reactJsonEditOptions,
    collapsed: true,
    collapseStringsAfterLength: 15,
    enableClipboard: false,
};

const nonAdminViewOptions = {
    ...reactJsonViewOptions,
    displayObjectSize: false,
    displayDataTypes: false,
}

export const CommonJsonField = ({ source }) => {
    const isAdmin = useIsAdmin();
    const options = isAdmin ? reactJsonViewOptions : nonAdminViewOptions;

    return (
        <div onClick={e => e.stopPropagation()}>
            <JsonField source={source} reactJsonOptions={options} />
        </div>
    )
};

export const CommonJsonInput = ({ source }) => (
    <JsonInput source={source} reactJsonOptions={reactJsonEditOptions} />
);
