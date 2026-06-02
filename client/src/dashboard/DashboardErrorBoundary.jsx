import { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export class DashboardErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('DashboardErrorBoundary caught an error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box mt={3} p={2} border="1px solid" borderColor="error.light" borderRadius={1} textAlign="center">
                    <Typography color="error" variant="body2" gutterBottom>
                        {this.props.fallbackMessage || 'אירעה שגיאה בטעינת הרכיב'}
                    </Typography>
                    <Button size="small" onClick={() => this.setState({ hasError: false })}>
                        נסה שנית
                    </Button>
                </Box>
            );
        }
        return this.props.children;
    }
}
