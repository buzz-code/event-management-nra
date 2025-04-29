import { isAdmin } from "./permissionsUtil";
import { AlertColor } from "@mui/material/Alert";

function isShowTrialMessage(permissions: any, user: any): boolean {
    if (isAdmin(permissions)) return false;
    if (!user) return false;
    if (user.isPaid) return false;
    return true;
}

export function getTrialAlert(permissions: any, user: any): { type: AlertColor, message: string } {
    if (!isShowTrialMessage(permissions, user)) return null;

    if (isTrialEnded(user)) {
        return {
            type: 'error',
            message: getTrialEndedMessage(user),
        }
    }

    const leftDays = getLeftDays(user);
    if (!leftDays) {
        return {
            type: 'info',
            message: 'חשבון חינמי מוגבל בפעילות',
        }
    }

    return {
        type: 'warning',
        message: getTrialMessage(user, leftDays),
    }
}

function getTrialMessage(user: any, leftDays: number): string {
    if (user.additionalData?.customTrialMessage) {
        return user.additionalData.customTrialMessage.replace('{0}', leftDays);
    }
    return `חשבון חינמי, ייסגר בעוד ${leftDays} ימים`;
}

function getTrialEndedMessage(user: any): string {
    if (user.additionalData?.customTrialEndedMessage) {
        return user.additionalData.customTrialEndedMessage;
    }
    return 'חשבונך נסגר עקב חוסר תשלום';
}

function isTrialEnded(user: any): boolean {
    if (user.additionalData?.trialEndDate) {
        const trialEndDate = new Date(user.additionalData.trialEndDate);
        return trialEndDate < new Date();
    }
    return false;
}

function getLeftDays(user: any): number {
    if (user.additionalData?.trialEndDate) {
        const trialEndDate = new Date(user.additionalData.trialEndDate);
        const leftMillis = trialEndDate.getTime() - new Date().getTime();
        return Math.ceil(leftMillis / (1000 * 60 * 60 * 24));
    }
    return null;
}
