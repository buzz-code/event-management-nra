import { Create, SimpleForm, TopToolbar, ListButton, Toolbar, SaveButton, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const CreateToolbar = (props) => {
    const { reset } = useFormContext();
    const notify = useNotify();

    return (
        <Toolbar {...props}>
            <SaveButton />
            <SaveButton
                label="ra.action.save_and_add"
                mutationOptions={{
                    onSuccess: data => {
                        notify('ra.notification.created', {
                            type: 'info',
                            messageArgs: { smart_count: 1 },
                        });
                        reset();
                    }
                }}
                type="button"
                variant="text"
            />
        </Toolbar>
    );
}

export const CommonCreate = ({ children, ...props }) => (
    <Create actions={<CreateActions />} redirect='list' {...props}>
        <SimpleForm toolbar={<CreateToolbar />}>
            {children}
        </SimpleForm>
    </Create>
)