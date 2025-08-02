using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services.Exceptions;
using StorageManagerServer.Services;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Api.Controllers;

[Route("api/measure")]
[ApiController]
public class MeasureController(
    IMeasureService _measureService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateMeasureAsync(string measureName)
    {
        var rsModel = await _measureService.CreateMeasureAsync(measureName);

        return Ok(rsModel);
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetMeasureByIdAsync(Guid id)
    {
        var rsModel = await _measureService.GetMeasureByIdAsync(id);

        return Ok(rsModel);
    }

    [HttpGet("get-active")]
    public async Task<IActionResult> GetActiveMeasuresAsync()
    {
        var rsModelList = await _measureService.GetActiveMeasuresAsync();

        return Ok(rsModelList);
    }

    [HttpGet("get-archived")]
    public async Task<IActionResult> GetArchivedMeasuresAsync()
    {
        var rsModelList = await _measureService.GetArchivedMeasuresAsync();

        return Ok(rsModelList);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateMeasureAsync(UpdateMeasureRqModel rqModel)
    {
        var rsModel = await _measureService.UpdateMeasureAsync(rqModel);

        return Ok(rsModel);
    }

    [HttpPut("update-state")]
    public async Task<IActionResult> UpdateMeasureStateByIdAsync(Guid id)
    {
        var result = await _measureService.UpdateMeasureStateByIdAsync(id);

        return Ok(result);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteMeasureByIdAsync(Guid id)
    {
        var result = await _measureService.DeleteMeasureByIdAsync(id);

        return Ok(result);
    }
}
