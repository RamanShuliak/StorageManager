namespace StorageManagerServer.Domain.Models.RqModels;

public class UpdateClientRqModel
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Address { get; set; }
}
