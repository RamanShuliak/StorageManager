using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services.Exceptions;
using StorageManagerServer.Services;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Api.Controllers;

[Route("api/resource")]
[ApiController]
public class ResourceController(
    IResourceService _resourceService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateResourceAsync(string resourceName)
    {
        try
        {
            var rsModel = await _resourceService.CreateResourceAsync(resourceName);

            return Ok(rsModel);
        }
        catch (EntityAlreadyExistsException ex)
        {
            return StatusCode(409, $"Conflict exception during Resource creation: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Resource creation.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Resource creation: {ex.Message}.");
        }
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetResourceByIdAsync(Guid id)
    {
        try
        {
            var rsModel = await _resourceService.GetResourceByIdAsync(id);

            return Ok(rsModel);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during Resource getting: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Resource getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Resource getting: {ex.Message}.");
        }
    }

    [HttpGet("get-active")]
    public async Task<IActionResult> GetActiveResourcesAsync()
    {
        try
        {
            var rsModelList = await _resourceService.GetActiveResourcesAsync();

            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during active Resources getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during active Resources getting: {ex.Message}.");
        }
    }

    [HttpGet("get-archived")]
    public async Task<IActionResult> GetArchivedResourcesAsync()
    {
        try
        {
            var rsModelList = await _resourceService.GetArchivedResourcesAsync();

            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during archived Resources getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during archived Resources getting: {ex.Message}.");
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateResourceAsync(UpdateResourceRqModel rqModel)
    {
        try
        {
            var rsModel = await _resourceService.UpdateResourceAsync(rqModel);

            return Ok(rsModel);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during Resource updating: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Resource updating.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Resource updating: {ex.Message}.");
        }
    }

    [HttpPut("update-state")]
    public async Task<IActionResult> UpdateResourceStateByIdAsync(Guid id)
    {
        try
        {
            var result = await _resourceService.UpdateResourceStateByIdAsync(id);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during updating Resource state: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during updating Resource state.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during updating Resource state: {ex.Message}.");
        }
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteResourceByIdAsync(Guid id)
    {
        try
        {
            var result = await _resourceService.DeleteResourceByIdAsync(id);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during deleting Resource: {ex.Message}.");
        }
        catch (EntityHasIncludesException ex)
        {
            return StatusCode(409, $"Conflict exception during deleting Resource: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during deleting Resource.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during deleting Resource: {ex.Message}.");
        }
    }
}
