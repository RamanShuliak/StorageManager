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
        try
        {
            var rsModel = await _measureService.CreateMeasureAsync(measureName);

            return Ok(rsModel);
        }
        catch (EntityAlreadyExistsException ex)
        {
            return StatusCode(409, $"Conflict exception during Measure creation: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Measure creation.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Measure creation: {ex.Message}.");
        }
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetMeasureByIdAsync(Guid id)
    {
        try
        {
            var rsModel = await _measureService.GetMeasureByIdAsync(id);

            return Ok(rsModel);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during Measure getting: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Measure getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Measure getting: {ex.Message}.");
        }
    }

    [HttpGet("get-active")]
    public async Task<IActionResult> GetActiveMeasuresAsync()
    {
        try
        {
            var rsModelList = await _measureService.GetActiveMeasuresAsync();

            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during active Measures getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during active Measures getting: {ex.Message}.");
        }
    }

    [HttpGet("get-archived")]
    public async Task<IActionResult> GetArchivedMeasuresAsync()
    {
        try
        {
            var rsModelList = await _measureService.GetArchivedMeasuresAsync();

            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during archived Measures getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during archived Measures getting: {ex.Message}.");
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateMeasureAsync(UpdateMeasureRqModel rqModel)
    {
        try
        {
            var rsModel = await _measureService.UpdateMeasureAsync(rqModel);

            return Ok(rsModel);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during Measure updating: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Measure updating.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Measure updating: {ex.Message}.");
        }
    }

    [HttpPut("update-state")]
    public async Task<IActionResult> UpdateMeasureStateByIdAsync(Guid id)
    {
        try
        {
            var result = await _measureService.UpdateMeasureStateByIdAsync(id);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during updating Measure state: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during updating Measure state.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during updating Measure state: {ex.Message}.");
        }
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteMeasureByIdAsync(Guid id)
    {
        try
        {
            var result = await _measureService.DeleteMeasureByIdAsync(id);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during deleting Measure: {ex.Message}.");
        }
        catch (EntityHasIncludesException ex)
        {
            return StatusCode(409, $"Conflict exception during deleting Measure: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during deleting Measure.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during deleting Measure: {ex.Message}.");
        }
    }
}
