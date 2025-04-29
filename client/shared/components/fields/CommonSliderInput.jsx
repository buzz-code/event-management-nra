import { useInput } from 'react-admin';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

export const CommonSliderInput = ({ source, ...props }) => {
    const { id, field, fieldState, formState, isRequired } = useInput({ source });

    return (
        <Box spacing={1}>
            <Slider
                aria-labelledby={id}
                valueLabelDisplay="auto"
                step={1}
                marks
                {...field}
                {...props}
            />
            {fieldState.error && <span>{fieldState.error.message}</span>}
        </Box>
    )
}

