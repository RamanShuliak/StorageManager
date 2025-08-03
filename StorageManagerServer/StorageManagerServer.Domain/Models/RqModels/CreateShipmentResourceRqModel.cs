namespace StorageManagerServer.Domain.Models.RqModels;

public class CreateShipmentResourceRqModel
{
    public int Amount { get; set; }
    public Guid ResourceId { get; set; }
    public Guid MeasureId { get; set; }
}