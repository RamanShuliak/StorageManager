namespace StorageManagerServer.Domain.Models.RsModels;

public class ReceiptResourceRsModel
{
    public Guid Id { get; set; }
    public int Amount { get; set; }
    public Guid ResourceId { get; set; }
    public string ResourceName { get; set; } = string.Empty;
    public Guid MeasureId { get; set; }
    public string MeasureName { get; set; } = string.Empty;
}
