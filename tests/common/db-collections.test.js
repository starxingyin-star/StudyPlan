const {
  ensureCoreCollections,
  collections,
  collectionWithCreate,
  getDocsByQuery,
  setDoc
} = require('../../cloudfunctions/api/common/db');

function createMissingCollectionError() {
  const error = new Error('database collection not exists');
  error.code = 'DATABASE_COLLECTION_NOT_EXIST';
  error.errCode = -502005;
  return error;
}

function createDb(existingNames = []) {
  const existing = new Set(existingNames);
  const created = [];
  const limited = [];

  return {
    created,
    limited,
    collection(name) {
      return {
        where() {
          return {
            limit(count) {
              limited.push({ name, count });
              return this;
            },
            async get() {
              if (!existing.has(name)) {
                throw createMissingCollectionError();
              }
              return { data: [] };
            }
          };
        }
      };
    },
    async createCollection(name) {
      created.push(name);
      existing.add(name);
      return { requestId: `create-${name}` };
    }
  };
}

describe('core database collections', () => {
  test('creates missing family membership collections before handlers query them', async () => {
    const db = createDb(['families']);

    await ensureCoreCollections(db, ['families', 'familyMembers']);

    expect(db.created).toEqual(['familyMembers']);
  });

  test('checks core collections in parallel to avoid cloud function timeout', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const db = {
      collection() {
        return {
          where() {
            return {
              limit() {
                return this;
              },
              async get() {
                inFlight += 1;
                maxInFlight = Math.max(maxInFlight, inFlight);
                await new Promise((resolve) => setTimeout(resolve, 1));
                inFlight -= 1;
                return { data: [] };
              }
            };
          }
        };
      },
      async createCollection() {}
    };

    await ensureCoreCollections(db, ['families', 'familyMembers', 'members']);

    expect(maxInFlight).toBeGreaterThan(1);
  });

  test('uses a one-document probe when checking whether collections exist', async () => {
    const db = createDb(['families', 'familyMembers']);

    await ensureCoreCollections(db, ['families', 'familyMembers']);

    expect(db.limited).toEqual([
      { name: 'families', count: 1 },
      { name: 'familyMembers', count: 1 }
    ]);
  });

  test('treats a missing collection query as empty so bootstrap does not timeout creating tables', async () => {
    const collection = createDb([]).collection('familyMembers');

    const docs = await getDocsByQuery(collection, { openid: 'new-user' });

    expect(docs).toEqual([]);
  });

  test('creates a missing collection on first write and retries the document write', async () => {
    const db = createDb([]);
    const collection = db.collection('familyMembers');
    collection.collectionName = 'familyMembers';
    collection.createCollection = () => db.createCollection('familyMembers');
    let writes = 0;
    collection.doc = () => ({
      async set() {
        writes += 1;
        if (writes === 1) {
          throw createMissingCollectionError();
        }
      }
    });

    await setDoc(collection, 'family-a_openid-a', {
      familyId: 'family-a',
      openid: 'openid-a'
    });

    expect(db.created).toEqual(['familyMembers']);
    expect(writes).toBe(2);
  });

  test('default collection wrappers expose a collection creator for lazy writes', () => {
    expect(collections.familyMembers.collectionName).toBe('familyMembers');
    expect(typeof collections.familyMembers.createCollection).toBe('function');
  });

  test('creates a missing collection on first add and retries the add write', async () => {
    let writes = 0;
    const created = [];
    const db = {
      collection() {
        return {
          async add() {
            writes += 1;
            if (writes === 1) {
              throw createMissingCollectionError();
            }
            return { _id: 'ledger-1' };
          }
        };
      },
      async createCollection(name) {
        created.push(name);
      }
    };
    const collection = collectionWithCreate('pointLedgers', db);

    await collection.add({ data: { familyId: 'family-a' } });

    expect(created).toEqual(['pointLedgers']);
    expect(writes).toBe(2);
  });
});
