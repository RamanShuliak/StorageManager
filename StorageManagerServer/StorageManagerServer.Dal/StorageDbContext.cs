using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal;

public class StorageDbContext : DbContext
{
    public StorageDbContext(DbContextOptions<StorageDbContext> options)
        : base(options) { }

    public virtual DbSet<Balance> Balances { get; set; } = null!;
    public virtual DbSet<Client> Clients { get; set; } = null!;
    public virtual DbSet<Measure> Measures { get; set; } = null!;
    public virtual DbSet<Resource> Resources { get; set; } = null!;
    public virtual DbSet<ReceiptDocument> ReceiptDocuments { get; set; } = null!;
    public virtual DbSet<ReceiptResource> ReceiptResources { get; set; } = null!;
    public virtual DbSet<ShipmentDocument> ShipmentDocuments { get; set; } = null!;
    public virtual DbSet<ShipmentResource> ShipmentResources { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Balance>(entity =>
        {
            entity
                .HasOne(b => b.Resource)
                .WithMany(r => r.Balances)
                .HasForeignKey(b => b.ResourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(b => b.Measure)
                .WithMany(m => m.Balances)
                .HasForeignKey(b => b.MeasureId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity
                .HasMany(c => c.ShipmentDocuments)
                .WithOne(sd => sd.Client)
                .HasForeignKey(sd => sd.ClientId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Measure>(entity =>
        {
            entity
                .HasMany(m => m.Balances)
                .WithOne(b => b.Measure)
                .HasForeignKey(b => b.MeasureId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasMany(m => m.ReceiptResources)
                .WithOne(rr => rr.Measure)
                .HasForeignKey(rr => rr.MeasureId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(m => m.ShipmentResources)
                .WithOne(sr => sr.Measure)
                .HasForeignKey(sr => sr.MeasureId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Resource>(entity =>
        {
            entity
                .HasMany(r => r.Balances)
                .WithOne(b => b.Resource)
                .HasForeignKey(b => b.ResourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasMany(r => r.ReceiptResources)
                .WithOne(rr => rr.Resource)
                .HasForeignKey(rr => rr.ResourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(r => r.ShipmentResources)
                .WithOne(sr => sr.Resource)
                .HasForeignKey(sr => sr.ResourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ReceiptDocument>(entity =>
        {
            entity
                .HasMany(rd => rd.ReceiptResources)
                .WithOne(rr => rr.Document)
                .HasForeignKey(rr => rr.DocumentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ReceiptResource>(entity =>
        {
            entity
                .HasOne(rr => rr.Resource)
                .WithMany(r => r.ReceiptResources)
                .HasForeignKey(rr => rr.ResourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(rr => rr.Measure)
                .WithMany(m => m.ReceiptResources)
                .HasForeignKey(rr => rr.MeasureId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(rr => rr.Document)
                .WithMany(rd => rd.ReceiptResources)
                .HasForeignKey(rr => rr.DocumentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShipmentDocument>(entity =>
        {
            entity
                .HasOne(sd => sd.Client)
                .WithMany(c => c.ShipmentDocuments)
                .HasForeignKey(sd => sd.ClientId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(sd => sd.ShipmentResources)
                .WithOne(sr => sr.Document)
                .HasForeignKey(sr => sr.DocumentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShipmentResource>(entity =>
        {
            entity
                .HasOne(sr => sr.Resource)
                .WithMany(r => r.ShipmentResources)
                .HasForeignKey(sr => sr.ResourceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(sr => sr.Measure)
                .WithMany(m => m.ShipmentResources)
                .HasForeignKey(sr => sr.MeasureId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(sr => sr.Document)
                .WithMany(sd => sd.ShipmentResources)
                .HasForeignKey(sr => sr.DocumentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

