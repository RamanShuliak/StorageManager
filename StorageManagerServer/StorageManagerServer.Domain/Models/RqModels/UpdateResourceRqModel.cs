namespace StorageManagerServer.Domain.Models.RqModels;

public class UpdateResourceRqModel
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
}
