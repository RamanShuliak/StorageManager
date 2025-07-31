namespace StorageManagerServer.Domain.Models.RsModels;

public class ClientRsModel
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Address { get; set; }
    public bool IsArchived { get; set; }

}
