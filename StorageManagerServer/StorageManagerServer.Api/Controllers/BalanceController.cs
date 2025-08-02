using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Api.Controllers;

[Route("api/balance")]
[ApiController]
public class BalanceController(
    IBalanceService _balanceService) : ControllerBase
{
    [HttpGet("get-list")]
    public async Task<IActionResult> GetBalanceListByParamsAsync(
        [FromQuery] GetBalanceListByParamsRqModel rqModel)
    {
        var rsModelList = await _balanceService.GetBalanceListByParamsAsync(rqModel);
        return Ok(rsModelList);
    }

}
