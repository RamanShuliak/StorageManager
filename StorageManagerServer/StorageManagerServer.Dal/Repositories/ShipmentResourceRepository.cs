namespace StorageManagerServer.Dal.Repositories;

public interface IShipmentResourceRepository
{

}

public class ShipmentResourceRepository(
    StorageDbContext _dbContext) : IShipmentResourceRepository
{
}
