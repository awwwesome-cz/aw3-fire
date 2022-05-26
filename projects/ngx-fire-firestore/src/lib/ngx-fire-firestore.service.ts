import {Injectable} from '@angular/core';
import {
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    docData,
    Firestore,
    getDoc,
    getDocs, orderBy, query,
    setDoc,
    updateDoc, writeBatch
} from '@angular/fire/firestore';
import {doc, Timestamp} from 'firebase/firestore';
import {Observable} from 'rxjs';
import {QueryConstraint} from '@firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class NgxFireFirestoreService {

    /**
     * https://cloud.google.com/firestore/quotas#writes_and_transactions
     */
    static MAX_WRITES_PER_BATCH = 500;

    constructor(
        private firestore: Firestore
    ) {
    }

    col$<T>(refPath: string, ...queryConstraints: QueryConstraint[]): Observable<T[]> {
        const ref = collection(this.firestore, refPath);
        const q = query(ref, ...queryConstraints);
        return collectionData(q) as Observable<T[]>;
    }

    async colOnce<T>(refPath: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
        const ref = collection(this.firestore, refPath);
        const q = query(ref, ...queryConstraints);
        const snap = await getDocs(q);
        return snap.docs.map(_doc => {
            return _doc.data() as T;
        }) as T[];
    }

    colWithUid$<T>(refPath: string, ...queryConstraints: QueryConstraint[]): Observable<T[]> {
        const ref = collection(this.firestore, refPath);
        const q = query(ref, ...queryConstraints);
        return collectionData(q, {idField: 'uid'}) as Observable<T[]>;
    }

    colOnceWithUid = async <T>(refPath: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> => {
        const ref = collection(this.firestore, refPath);
        const q = query(ref, ...queryConstraints);
        const snap = await getDocs(q);

        return snap.docs.map(_doc => {
            return {
                uid: _doc.id,
                ..._doc.data()
            } as unknown as T;
        }) as any as T[];
    };

    doc$<T>(refPath: string): Observable<T> {
        const ref = doc(this.firestore, refPath);
        return docData(ref) as Observable<T>;
    }

    async docOnce<T>(refPath: string): Promise<T> {
        const ref = doc(this.firestore, refPath);
        const snap = await getDoc(ref);
        return snap.data() as T;
    }

    async docOnceWithUid<T>(refPath: string): Promise<T> {
        const ref = doc(this.firestore, refPath);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            throw new Error('firestore-document-not-exist');
        }
        return {
            uid: snap.id,
            ...snap.data()
        } as any as T;
    }

    docWithUid$<T>(refPath: string): Observable<T> {
        const ref = doc(this.firestore, refPath);
        return docData(ref, {idField: 'uid'}) as Observable<T>;
    }

    addDoc<T>(collectionPath: string, data: any, timestamps = true) {
        const ref = collection(this.firestore, collectionPath);

        if (timestamps) {
            return addDoc(ref, {
                ...data,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            });
        } else {
            return addDoc(ref, data);
        }

    }

    /**
     * Create document
     */
    setDoc(docPath: string, data: any, timestamps = true) {
        const ref = doc(this.firestore, docPath);
        if (timestamps) {
            return setDoc(ref, {
                ...data,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            });
        } else {
            return setDoc(ref, data);
        }
    }

    /**
     * Create or update/replace document
     *
     * Set new document (data) to path, add created_at (if not exist) and updated_at to now
     */
    saveDoc(docPath: string, data: any, timestamps = true) {
        const ref = doc(this.firestore, docPath);
        if (timestamps) {
            return setDoc(ref, {
                ...data,
                created_at: data.created_at ? data.created_at : Timestamp.now(),
                updated_at: Timestamp.now()
            });
        } else {
            return setDoc(ref, data);
        }
    }

    /**
     * Update/replace document
     */
    updateDoc(docPath: string, data: any, timestamp = true) {
        const ref = doc(this.firestore, docPath);
        if (timestamp) {
            return updateDoc(ref, {
                ...data,
                updated_at: Timestamp.now()
            });
        } else {
            return updateDoc(ref, data);
        }
    }

    /**
     * Delete document
     */
    deleteDoc(docPath: string) {
        return deleteDoc(this.ref(docPath));
    }

    /**
     * Get Batch
     *
     * Use maximum of quota! See https://cloud.google.com/firestore/quotas#writes_and_transactions
     *
     * FirestoreService.MAX_WRITES_PER_BATCH
     */
    writeBatch() {
        return writeBatch(this.firestore);
    }

    /**
     * Get Reference
     */
    ref(docPath: string) {
        return doc(this.firestore, docPath);
    }
}
