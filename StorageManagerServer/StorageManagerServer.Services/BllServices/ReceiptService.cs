using StorageManagerServer.Dal.Repositories;

namespace StorageManagerServer.Services.BllServices;

public interface IReceiptService
{

}

public class ReceiptService(
    IUnitOfWork _uoW) : IReceiptService
{
}
