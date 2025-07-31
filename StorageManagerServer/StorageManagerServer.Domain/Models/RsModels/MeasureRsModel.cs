namespace StorageManagerServer.Domain.Models.RsModels;

public class MeasureRsModel
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsArchived { get; set; }
}
