namespace StorageManagerServer.Domain.Models.RqModels;

public class UpdateReceiptDocumentRqModel
{
    public Guid Id { get; set; }
    public required string Number { get; set; }
    public DateTime ReceiptDate { get; set; }

    public List<CreateReceiptResourceRqModel> CreateResources { get; set; } = new List<CreateReceiptResourceRqModel>();
    public List<UpdateReceiptResourceRqModel> UpdateResources { get; set; } = new List<UpdateReceiptResourceRqModel>();
    public List<Guid> DeleteResourceIds { get; set; } = new List<Guid>();
}
