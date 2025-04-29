import HelpIcon from '@mui/icons-material/Help';
import { BulkActionButton } from './BulkActionButton';

export const BulkFixReferenceButton = () => (
    <BulkActionButton name='fixReferences' label='תיקון שיוך תלמידה' icon={<HelpIcon />} reloadOnEnd />
);
