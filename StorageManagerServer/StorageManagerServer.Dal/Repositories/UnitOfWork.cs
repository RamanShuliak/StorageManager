namespace StorageManagerServer.Dal.Repositories;

public interface IUnitOfWork
{
    IBalanceRepository Balances { get; }
    IClientRepository Clients { get; }
    IMeasureRepository Measures { get; }
    IReceiptDocumentRepository ReceiptDocuments { get; }
    IReceiptResourceRepository ReceiptResources { get; }
    IResourceRepository Resources { get; }
    IShipmentDocumentRepository ShipmentDocuments { get; }
    IShipmentResourceRepository ShipmentResources { get; }

    Task<int> SaveChangesAsync();
}

public class UnitOfWork(
    StorageDbContext _dbContext) : IUnitOfWork
{
    public IBalanceRepository Balances { get; } = new BalanceRepository(_dbContext);
    public IClientRepository Clients { get; } = new ClientRepository(_dbContext);
    public IMeasureRepository Measures { get; } = new MeasureRepository(_dbContext);
    public IReceiptDocumentRepository ReceiptDocuments { get; } = new ReceiptDocumentRepository(_dbContext);
    public IReceiptResourceRepository ReceiptResources { get; } = new ReceiptResourceRepository(_dbContext);
    public IResourceRepository Resources { get; } = new ResourceRepository(_dbContext);
    public IShipmentDocumentRepository ShipmentDocuments { get; } = new ShipmentDocumentRepository(_dbContext);
    public IShipmentResourceRepository ShipmentResources { get; } = new ShipmentResourceRepository(_dbContext);

    public async Task<int> SaveChangesAsync() => await _dbContext.SaveChangesAsync();
}

