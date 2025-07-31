using StorageManagerServer.Dal.Repositories;

namespace StorageManagerServer.Services.BllServices;

public interface IShipmentService
{

}

public class ShipmentService(
    IUnitOfWork _uoW) : IShipmentService
{
}
