namespace StorageManagerServer.Domain.Models.RqModels;

public class UpdateMeasureRqModel
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
}
