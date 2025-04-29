import { EmailField, useRecordContext } from "react-admin"
import get from 'lodash/get';

export const CommonMailField = ({source, domain = 'mail.yoman.online'}) =>{
    const record = useRecordContext();

    if(!record || !get(record, source)){
        return null;
    }

    const emailAddress = `${get(record, source)}@${domain}`;
    record.emailAddress111 = emailAddress;
    return (
        <EmailField source="emailAddress111" />
    )
}
