import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/Home.tsx"),
  route("startups", "routes/Startups.tsx"),
  route("startups/new", "routes/Startups.new.tsx"),
  route("startups/:id", "routes/Startups.$id.tsx"),
  route("startups/:id/edit", "routes/Startups.edit.$id.tsx"),
  route("investors", "routes/Investors.tsx"),
  route("investors/new", "routes/Investors.new.tsx"),
  route("investors/:id", "routes/Investors.$id.tsx"),
  route("investors/:id/edit", "routes/Investors.edit.$id.tsx"),
  route("founders", "routes/Founders.tsx"),
  route("founders/new", "routes/Founders.new.tsx"),
  route("founders/:id", "routes/Founders.$id.tsx"),
  route("founders/:id/edit", "routes/Founders.edit.$id.tsx"),
  route("network", "routes/Network.tsx"),
  route("queries", "routes/Queries.tsx"),
] satisfies RouteConfig;