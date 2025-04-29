import React, { useCallback, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import { useInput } from 'react-admin';

export const CommonNumberByBooleanInput = ({ source, label, max, ...props }) => {
    const { field } = useInput({ source });
    const [values, setValues] = useState(new Array(max).fill(false));

    useEffect(() => {
        const newValues = new Array(max).fill(false);
        for (let i = 0; i < Math.min(max, field.value); i++) {
            newValues[i] = true;
        }
        setValues(newValues);
        field.onChange(newValues.filter(v => v).length);
    }, [field.value, max]);

    const handleChange = useCallback((e) => {
        const newValues = [...values];
        newValues[e.target.dataset.index] = e.target.checked;
        setValues(newValues);
        field.onChange(newValues.filter(v => v).length);
    }, [values, field]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <Typography variant="body1" component="div">
                    {label}
                </Typography>
            </Grid>
            {new Array(max).fill(0).map((_, i) => (
                <Grid item key={source + '_' + i} xs={10 / max}>
                    <Switch value={values[i]} onChange={handleChange} inputProps={{ 'data-index': i }} {...props} />
                </Grid>
            ))}
        </Grid>
    )
}
