namespace StorageManagerServer.Domain.Models.RqModels;

public class UpdateShipmentResourceRqModel
{
    public Guid Id { get; set; }
    public int Amount { get; set; }
    public Guid ResourceId { get; set; }
    public Guid MeasureId { get; set; }
}
