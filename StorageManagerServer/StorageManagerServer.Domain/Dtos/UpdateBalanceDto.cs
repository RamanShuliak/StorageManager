namespace StorageManagerServer.Domain.Dtos;

public class UpdateBalanceDto
{
    public int Amount { get; set; }
    public Guid ResourceId { get; set; }
    public Guid MeasureId { get; set; }

}
