namespace StorageManagerServer.Domain.Models.RqModels;

public class GetBalanceListByParamsRqModel
{
    public List<Guid> ResourceIds { get; set; } = new List<Guid>();
    public List<Guid> MeasureIds { get; set; } = new List<Guid>();
}
