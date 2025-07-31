namespace StorageManagerServer.Domain.Entities;

public class ReceiptDocument : BaseEntity
{
    public required string Number { get; set; }

    public List<ReceiptResource> ReceiptResources { get; set; } = new List<ReceiptResource>();

}
