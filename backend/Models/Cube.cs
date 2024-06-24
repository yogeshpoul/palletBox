using Microsoft.EntityFrameworkCore;

namespace PositionStore.Models
{
    public class Cube
    {
        public int Id { get; set; }
        public string CaseName { get; set; } = string.Empty;
        public float Width { get; set; }
        public float Height { get; set; }
        public float Length { get; set; }  // Corrected from Depth to Length
        public float Mass { get; set; }
    }

    public class CubeDbContext : DbContext
    {
        public CubeDbContext(DbContextOptions<CubeDbContext> options) : base(options) { }
        public DbSet<Cube> Cubes { get; set; } = null!;
    }
}
