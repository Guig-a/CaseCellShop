import { InMemoryStore } from './in-memory.store';
import { InsufficientStockError, StockService } from './stock.service';

describe('StockService', () => {
  let store: InMemoryStore;
  let service: StockService;

  beforeEach(() => {
    store = new InMemoryStore();
    service = new StockService(store);
  });

  it('reserves available stock', async () => {
    await expect(service.reserve('case-iphone-15', 2)).resolves.toBe(3);

    expect(service.getAvailable('case-iphone-15')).toBe(3);
  });

  it('rejects reservation when stock is insufficient', async () => {
    await expect(service.reserve('case-moto-g84', 2)).rejects.toBeInstanceOf(
      InsufficientStockError,
    );

    expect(service.getAvailable('case-moto-g84')).toBe(1);
  });

  it('serializes concurrent reservations for the same stock', async () => {
    service.reset({ 'case-moto-g84': 1 });

    const results = await Promise.allSettled([
      service.reserve('case-moto-g84', 1),
      service.reserve('case-moto-g84', 1),
    ]);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(service.getAvailable('case-moto-g84')).toBe(0);
  });
});
