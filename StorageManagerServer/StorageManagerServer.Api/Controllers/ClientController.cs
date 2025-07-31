using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services;
using StorageManagerServer.Services.BllServices;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Api.Controllers;

[Route("api/client")]
[ApiController]
public class ClientController(
    IClientService _clientService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateClientAsync(CreateClientRqModel rqModel)
    {
        try
        {
            var rsModel = await _clientService.CreateClientAsync(rqModel);

            return Ok(rsModel);
        }
        catch (EntityAlreadyExistsException ex)
        {
            return StatusCode(409, $"Exception during Client creation: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Client creation.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Client creation: {ex.Message}.");
        }
    }

    [HttpGet("get-by-id")]
    public async Task<IActionResult> GetClientByIdAsync(Guid id)
    {
        try
        {
            var rsModel = await _clientService.GetClientByIdAsync(id);

            return Ok(rsModel);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Exception during Client getting: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Client getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Client getting: {ex.Message}.");
        }
    }

    [HttpGet("get-active")]
    public async Task<IActionResult> GetActiveClientsAsync()
    {
        try
        {
            var rsModelList = await _clientService.GetActiveClientsAsync();

            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during active Clients getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during active Clients getting: {ex.Message}.");
        }
    }

    [HttpGet("get-archived")]
    public async Task<IActionResult> GetArchivedClientsAsync()
    {
        try
        {
            var rsModelList = await _clientService.GetArchivedClientsAsync();

            return Ok(rsModelList);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during archived Clients getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during archived Clients getting: {ex.Message}.");
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateClientAsync(UpdateClientRqModel rqModel)
    {
        try
        {
            var rsModel = await _clientService.UpdateClientAsync(rqModel);

            return Ok(rsModel);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Exception during Client updating: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Client updating.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Client updating: {ex.Message}.");
        }
    }

    [HttpPut("update-state")]
    public async Task<IActionResult> UpdateClientStateByIdAsync(Guid id)
    {
        try
        {
            var result = await _clientService.UpdateClientStateByIdAsync(id);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Exception during updating Client state: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during updating Client state.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during updating Client state: {ex.Message}.");
        }
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteClientByIdAsync(Guid id)
    {
        try
        {
            var result = await _clientService.DeleteClientByIdAsync(id);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Exception during deleting Client: {ex.Message}.");
        }
        catch (EntityHasIncludesException ex)
        {
            return StatusCode(409, $"Exception during deleting Client: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during deleting Client.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during deleting Client: {ex.Message}.");
        }
    }
}
