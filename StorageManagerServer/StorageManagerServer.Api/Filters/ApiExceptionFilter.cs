using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Services.Exceptions;
using StorageManagerServer.Services;

namespace StorageManagerServer.Api.Filters;

public class ApiExceptionFilter : IAsyncExceptionFilter
{
    public async Task OnExceptionAsync(ExceptionContext context)
    {
        switch (context.Exception)
        {
            case EntityAlreadyExistsException ex:
                var entityAlreadyExistsPayload = new
                {
                    entityType = ex.EntityType,
                    paramName = ex.ParamName,
                    paramValue = ex.ParamValue,
                    message = ex.Message
                };
                context.Result = new ConflictObjectResult(entityAlreadyExistsPayload);
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"EntityAlreadyExistsException:\n{ex.Message}\n");
                break;

            case EntityInUseException ex:
                context.HttpContext.Response.StatusCode = 423;
                context.Result = new ObjectResult(new
                {
                    entityType = ex.EntityType,
                    entityId = ex.EntityId,
                    message = ex.Message
                });
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"EntityInUseException:\n{ex.Message}\n");
                break;

            case EntityNotFoundException ex:
                var entityNotFoundPayload = new
                {
                    entityType = ex.EntityType,
                    paramName = ex.ParamName,
                    paramValue = ex.ParamValue,
                    message = ex.Message
                };
                context.Result = new NotFoundObjectResult(entityNotFoundPayload);
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"EntityNotFoundException:\n{ex.Message}\n");
                break;

            case BalanceNotFoundException ex:
                var balanceNotFoundPayload = new
                {
                    resourceId = ex.ResourceId,
                    measureId = ex.MeasureId,
                    message = ex.Message
                };
                context.Result = new ObjectResult(balanceNotFoundPayload)
                {
                    StatusCode = StatusCodes.Status410Gone
                };
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"BalanceNotFoundException:\n{ex.Message}\n");
                break;

            case NegativeBalanceException ex:
                var negativeBalancePayload = new
                {
                    resourceId = ex.ResourceId,
                    measureId = ex.MeasureId,
                    message = ex.Message
                };
                context.Result = new UnprocessableEntityObjectResult(negativeBalancePayload);
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"NegativeBalanceException:\n{ex.Message}\n");
                break;

            case EmptyShipmentDocumentException ex:
                var emptyShipmentDocumentPayload = new
                {
                    documentNumber = ex.DocumentNumber,
                    message = ex.Message
                };
                context.Result = new ObjectResult(emptyShipmentDocumentPayload)
                {
                    StatusCode = StatusCodes.Status412PreconditionFailed
                };
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"EmptyShipmentDocumentException:\n{ex.Message}\n");
                break;

            default:
                var internalServerException = context.Exception;

                var messageToUse = internalServerException.InnerException?.Message
                                   ?? internalServerException.Message;

                var internalServerErrorPayload = new
                {
                    message = messageToUse
                };

                context.Result = new ObjectResult(internalServerErrorPayload)
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
                context.ExceptionHandled = true;

                await LogService.WriteErrorLogAsync($"Internal server exception:\n{messageToUse}\n");
                break;
        }
    }
}
