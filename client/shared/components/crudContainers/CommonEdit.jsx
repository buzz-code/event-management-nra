import { Edit, SimpleForm, TopToolbar, ListButton, Toolbar, SaveButton, useRedirect } from 'react-admin';

const EditActions = (props) => (
    <TopToolbar {...props}>
        <ListButton />
    </TopToolbar>
);

const EditToolbar = (props) => (
    <Toolbar {...props}>
        <SaveButton />
    </Toolbar>
);

export const CommonEdit = ({ children, ...props }) => (
    <Edit actions={<EditActions />} redirect='list' mutationMode='pessimistic' {...props}>
        <SimpleForm toolbar={<EditToolbar />}>
            {children}
        </SimpleForm>
    </Edit>
)