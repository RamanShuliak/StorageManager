using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services;
using StorageManagerServer.Services.BllServices;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Api.Controllers;

[Route("api/receipt")]
[ApiController]
public class ReceiptController(
    IReceiptService _receiptService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateDocumentAsync(
        CreateReceiptDocumentRqModel rqModel)
    {
        try
        {
            var result = await _receiptService.CreateDocumentAsync(rqModel);

            return Ok(result);
        }
        catch (EntityAlreadyExistsException ex)
        {
            return StatusCode(409, $"Conflict exception during Receipt document creation: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Receipt document creation.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Receipt document creation: {ex.Message}.");
        }
    }

    [HttpGet("get-list")]
    public async Task<IActionResult> GetDocumentListByParamsAsync(
        [FromQuery]GetDocumentListByParamsRqModel rqModel)
    {
        try
        {
            var rsModellist = await _receiptService.GetDocumentListByParamsAsync(rqModel);

            return Ok(rsModellist);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Receipt document list getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Receipt document list getting: {ex.Message}.");
        }
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetDocumentByIdAsync(Guid id)
    {
        try
        {
            var rsModel = await _receiptService.GetDocumentByIdAsync(id);

            if(rsModel == null)
                return StatusCode(404, $"Not Found exception during Receipt document getting: There is no document with Id = {id} in data base.");

            return Ok(rsModel);
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Receipt document getting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Receipt document getting: {ex.Message}.");
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateDocumentAsync(UpdateReceiptDocumentRqModel rqModel)
    {
        try
        {
            var result = await _receiptService.UpdateDocumentAsync(rqModel);

            return Ok(result);
        }
        catch(EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during Receipt document updating: {ex.Message}.");
        }
        catch(NegativeBalanceException ex)
        {
            return StatusCode(409, $"Conflict exception during Receipt document updating: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Receipt document updating.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Receipt document updating: {ex.Message}.");
        }
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteDocumentByIdAsync(Guid documentId)
    {
        try
        {
            var result = await _receiptService.DeleteDocumentByIdAsync(documentId);

            return Ok(result);
        }
        catch (EntityNotFoundException ex)
        {
            return StatusCode(404, $"Not Found exception during Receipt document deleting: {ex.Message}.");
        }
        catch (NegativeBalanceException ex)
        {
            return StatusCode(409, $"Conflict exception during Receipt document deleting: {ex.Message}.");
        }
        catch (Exception ex)
        {
            await LogService.WriteErrorLogAsync($"Internal server exception during Receipt document deleting.\n{ex.Message}\n");
            return StatusCode(500, $"Internal server exception during Receipt document deleting: {ex.Message}.");
        }
    }
}
