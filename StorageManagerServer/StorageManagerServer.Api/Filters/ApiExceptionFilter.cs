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
                var entityInUsePayload = new
                {
                    entityType = ex.EntityType,
                    entityId = ex.EntityId,
                    message = ex.Message
                };
                context.Result = new ConflictObjectResult(entityInUsePayload);
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
                context.Result = new NotFoundObjectResult(balanceNotFoundPayload);
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
                context.Result = new ConflictObjectResult(negativeBalancePayload);
                context.ExceptionHandled = true;
                await LogService.WriteWarningLogAsync($"NegativeBalanceException:\n{ex.Message}\n");
                break;

            default:
                var internalServerException = context.Exception;

                var internalServerErrorPayload = new
                {
                    message = internalServerException.Message
                };

                context.Result = new ObjectResult(internalServerErrorPayload)
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
                context.ExceptionHandled = true;

                await LogService.WriteErrorLogAsync($"Internal server exception:\n{internalServerException.Message}\n");
                break;
        }
    }
}
