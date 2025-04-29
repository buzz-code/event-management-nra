import { Card, CardContent } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { SimpleForm, TextInput, Title, useDataProvider, useNotify, Toolbar, SaveButton, RefreshButton } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import CallEndIcon from '@mui/icons-material/CallEnd'

const defaultValues = {
    ApiCallId: String(Math.random()),
    ApiDID: '', //0774311257
    ApiPhone: '', //0527609942
};
const TEXT_REGEX = /\=t-([^=\.]*)/
const PARAM_REGEX = /read=t-[^=]*=([^,\.]*)/
const required = (message = 'ra.validation.required') =>
    (value, allValues) => (value || allValues.hangup) ? undefined : message;


const YemotSimulator = () => {
    const dataProvider = useDataProvider();
    const [history, setHistory] = useState([]);
    const [params, setParams] = useState([]);
    const [isHangup, setIsHangup] = useState(false);
    const notify = useNotify();

    const { mutate, isPending } = useMutation({
        mutationFn: (body) => dataProvider.simulateYemotCall(body),
        onSuccess: (data) => {
            const parsedData = { lines: [], param: '' };
            for (const line of data.body.split('&')) {
                if (line.includes('hangup')) {
                    setIsHangup(true);
                    break;
                }
                const [, text] = TEXT_REGEX.exec(line);
                parsedData.lines.push(text);
                if (line.startsWith('read')) {
                    const [, param] = PARAM_REGEX.exec(line);
                    parsedData.param = param;
                }
            }

            setHistory(prevData => ([...prevData, parsedData.lines]));
            if (parsedData.param)
                setParams(prevData => ([parsedData.param]));

            notify('ra.yemot_simulator.step_success', { type: 'info' });
        },
        onError: () => {
            notify('ra.message.error', { type: 'error' });
        }
    });

    const handleSubmit = useCallback((body) => {
        mutate(body);
    }, [mutate])

    const handleReload = useCallback(() => {
        window.location.reload();
    }, []);

    const toolbar = (
        <Toolbar>
            <SaveButton disabled={isHangup} alwaysEnable={true} />
            <RefreshButton onClick={handleReload} sx={{ marginInline: '1rem' }} size='medium' />
            <HangupButton params={params} isHangup={isHangup} handleSubmit={handleSubmit} alwaysEnable={true} formNoValidate />
        </Toolbar>
    )

    // todo: autofill user phone
    return (
        <Card>
            <Title title="סימולטור" />
            <CardContent>
                <SimpleForm onSubmit={handleSubmit} defaultValues={defaultValues} toolbar={toolbar}>
                    <TextInput source="ApiCallId" label="מזהה שיחה" validate={required()} readOnly />
                    <TextInput source="ApiDID" label="מספר מערכת" validate={required()} />
                    <TextInput source="ApiPhone" label="מאת מס׳ טלפון" validate={required()} />
                    {params.map(param => (
                        <TextInput source={param} key={param} validate={required()} disabled={isHangup} />
                    ))}
                </SimpleForm>
                {history.map(item => <HistoryStep key={item} lines={item} />)}
                {isHangup && 'השיחה נותקה, אפשר לרענן בשביל להתחיל שיחה חדשה'}
            </CardContent>
        </Card>
    );
}

const HistoryStep = ({ lines }) => {
    return (
        <div>
            {lines.map(line => (
                <div>{line}</div>
            ))}
        </div>
    )
}

const HangupButton = ({ params, isHangup, handleSubmit, ...props }) => {
    const form = useFormContext();

    const handleClick = useCallback(() => {
        form.setValue('hangup', true);
    }, [form]);

    useEffect(() => {
        if (isHangup) {
            form.setValue('hangup', true);
            form.handleSubmit(handleSubmit);
        }
    }, [isHangup]);

    if (isHangup) {
        return null;
    }

    return <SaveButton onClick={handleClick} label={'ra.action.hangup'} icon={<CallEndIcon />} disabled={!params.length} {...props} />
}
export default YemotSimulator;
