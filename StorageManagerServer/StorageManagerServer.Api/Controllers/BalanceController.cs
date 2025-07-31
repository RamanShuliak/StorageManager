using Microsoft.AspNetCore.Mvc;
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
        Guid? resourceId = null,
        Guid? measureId = null)
    {
        try
        {
            var balanceList = await _balanceService.GetBalanceListByParamsAsync(
                resourceId, 
                measureId);

            return Ok(balanceList);
        }
        catch(Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Balance list getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Balance list getting: {ex.Message}.");
        }
    }
}
