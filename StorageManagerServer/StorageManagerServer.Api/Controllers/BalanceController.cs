using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services;
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
        try
        {
            var rsModelList = await _balanceService.GetBalanceListByParamsAsync(rqModel);
            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Balance list getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Balance list getting: {ex.Message}.");
        }
    }

}
