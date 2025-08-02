namespace StorageManagerServer.Domain.Models.RqModels;

public class CreateReceiptDocumentRqModel
{
    public required string Number { get; set; }
    public DateTime ReceiptDate { get; set; }
    public List<CreateReceiptResourceRqModel> Resources { get; set; } = new List<CreateReceiptResourceRqModel>();
}
