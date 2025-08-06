# -----------------------
# Stage 1: Сборка и публикация
# -----------------------
    FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
    WORKDIR /src
    
    # 1) Скопировать решение и проекты
    COPY StorageManagerServer.sln ./
    
    COPY StorageManagerServer.Api/StorageManagerServer.Api.csproj \
         StorageManagerServer.Api/
    COPY StorageManagerServer.Dal/StorageManagerServer.Dal.csproj \
         StorageManagerServer.Dal/
    COPY StorageManagerServer.Services/StorageManagerServer.Services.csproj \
         StorageManagerServer.Services/
    
    # 2) Восстановить зависимости только для проекта API (оно подтянет все ссылки)
    RUN dotnet restore StorageManagerServer.Api/StorageManagerServer.Api.csproj
    
    # 3) Скопировать весь код
    COPY . .
    
    # 4) Опубликовать API
    WORKDIR /src/StorageManagerServer.Api
    RUN dotnet publish -c Release -o /app/publish
    
    # -----------------------
    # Stage 2: Runtime
    # -----------------------
    FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
    WORKDIR /app
    
    COPY --from=build /app/publish ./
    
    ENV ASPNETCORE_URLS=http://+:5010
    EXPOSE 5010
    
    ENTRYPOINT ["dotnet", "StorageManagerServer.Api.dll"]
    