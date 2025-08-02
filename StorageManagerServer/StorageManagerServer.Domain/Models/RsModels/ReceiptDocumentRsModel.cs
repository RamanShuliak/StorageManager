namespace StorageManagerServer.Domain.Models.RsModels;

public class ReceiptDocumentRsModel
{
    public Guid Id { get; set; }
    public required string Number { get; set; }
    public DateTime ReceiptDate { get; set; }

    public List<ReceiptResourceRsModel> Resources { get; set; } = new List<ReceiptResourceRsModel>();
}
