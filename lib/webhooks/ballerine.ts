
import { db } from '../gcp';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

function verifyBallerineSignature(signature: string, body: string): boolean {
    // In production, implement HMAC verification using Cloud Key Management or env secrets
    // const hmac = crypto.createHmac('sha256', process.env.BALLERINE_WEBHOOK_SECRET);
    // const digest = hmac.update(body).digest('hex');
    // return signature === digest;
    return true; 
}

export async function handleBallerineEvent(signature: string, rawBody: string) {
    if (!verifyBallerineSignature(signature, rawBody)) {
        throw new Error('Ballerine signature verification failed');
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch (e) {
        throw new Error('Invalid JSON in webhook body');
    }

    console.log(`Processing Ballerine event: ${event.type}`);

    // Handle Workflow/Verification Completion
    if (event.type === 'verification.completed' || event.type === 'workflow.completed') {
        const { userId, status, verificationId, reason } = event.data || {};

        if (!userId) {
            console.warn('Missing userId in Ballerine event data');
            return;
        }
        
        // Map Ballerine status to our internal status
        // Ballerine statuses: 'approved', 'rejected', 'resubmission_needed'
        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'verified';
        else if (status === 'rejected') newStatus = 'rejected';
        else if (status === 'resubmission_needed') newStatus = 'pending';

        // Update user profile in Firestore
        const profileRef = doc(db, 'profiles', userId);
        
        const updates: any = {
            verificationStatus: newStatus,
            verificationId: verificationId,
            verifiedAt: newStatus === 'verified' ? new Date().toISOString() : null,
        };

        // If verified, we might bump their stage to Community
        if (newStatus === 'verified') {
            updates.stage = 'community';
            // Give them a reputation boost for verifying
            updates.reputationScore = 50; // Base score for verified users
        }

        await updateDoc(profileRef, updates);
        
        // Log to Admin System Logs
        await addDoc(collection(db, 'system_logs'), {
            event_type: 'verification.completed',
            severity: newStatus === 'verified' ? 'info' : 'warning',
            source: 'ballerine',
            notes: `User ${userId} verification status updated to ${newStatus}. Reason: ${reason || 'N/A'}`,
            payload: event.data,
            created_at: new Date()
        });
    }
    
    // Handle Status Changes (Granular)
    else if (event.type === 'verification.status.changed') {
         // Logic for incremental updates if needed
    }
}
