namespace StorageManagerServer.Domain.Dtos;

public class ChangeBalanceDto
{
    public int AmountChange { get; set; }
    public Guid ResourceId { get; set; }
    public Guid MeasureId { get; set; }
}
