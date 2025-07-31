using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal;

public class StorageDbContext(
    DbContextOptions<StorageDbContext> options) : DbContext(options)
{
    public virtual DbSet<Balance> Balances { get; set; } = null!;
    public virtual DbSet<Client> Clients { get; set; } = null!;
    public virtual DbSet<Measure> Measures { get; set; } = null!;
    public virtual DbSet<Resource> Resources { get; set; } = null!;
    public virtual DbSet<ReceiptDocument> ReceiptDocuments { get; set; } = null!;
    public virtual DbSet<ReceiptResource> ReceiptResources { get; set; } = null!;
    public virtual DbSet<ShipmentDocument> ShipmentDocuments { get; set; } = null!;
    public virtual DbSet<ShipmentResource> ShipmentResources { get; set; } = null!;
}
