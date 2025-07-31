namespace StorageManagerServer.Domain.Models.RsModels;

public class BalanceRsModel
{
    public int Amount { get; set; }
    public required string ResourceName { get; set; }
    public required string MeasureName { get; set; }
}
