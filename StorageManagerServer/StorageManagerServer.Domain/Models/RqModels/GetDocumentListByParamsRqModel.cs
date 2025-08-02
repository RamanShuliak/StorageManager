namespace StorageManagerServer.Domain.Models.RqModels;

public class GetDocumentListByParamsRqModel
{
    public List<string> DocNumbers { get; set; } = new List<string>();
    public List<Guid> ResourceIds { get; set; } = new List<Guid>();
    public List<Guid> MeasureIds { get; set; } = new List<Guid>();
    public DateTime? ReceiptFromDate { get; set; }
    public DateTime? ReceiptToDate { get; set; }
}
