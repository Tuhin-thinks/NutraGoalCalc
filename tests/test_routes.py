"""Integration tests for API routes using TestClient."""

from fastapi.testclient import TestClient


class TestHealth:
    def test_healthz(self, client: TestClient):
        resp = client.get("/api/v1/healthz")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestFoods:
    def test_list_all(self, client: TestClient):
        resp = client.get("/api/v1/foods")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] > 0
        assert len(data["foods"]) == data["count"]

    def test_filter_by_category(self, client: TestClient):
        resp = client.get("/api/v1/foods?category=protein")
        assert resp.status_code == 200
        for food in resp.json()["foods"]:
            assert food["category"] == "protein"

    def test_get_by_id(self, client: TestClient):
        resp = client.get("/api/v1/foods/chicken_breast_100g")
        assert resp.status_code == 200
        assert resp.json()["id"] == "chicken_breast_100g"

    def test_get_by_id_not_found(self, client: TestClient):
        resp = client.get("/api/v1/foods/nonexistent")
        assert resp.status_code == 404

    def test_categories(self, client: TestClient):
        resp = client.get("/api/v1/categories")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] > 0
        assert all("category" in c and "count" in c for c in data["categories"])

    def test_targets(self, client: TestClient):
        resp = client.get("/api/v1/targets")
        assert resp.status_code == 200
        data = resp.json()
        assert "daily_targets" in data
        assert "metadata" in data


class TestCalculate:
    def test_valid_request(self, client: TestClient):
        resp = client.post("/api/v1/calculate", json={
            "items": [{"food_id": "chicken_breast_100g", "quantity": 200}],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["totals"]["protein_g"] == 60.0
        assert len(data["items"]) == 1

    def test_unknown_food_404(self, client: TestClient):
        resp = client.post("/api/v1/calculate", json={
            "items": [{"food_id": "does_not_exist", "quantity": 1}],
        })
        assert resp.status_code == 404

    def test_empty_items_422(self, client: TestClient):
        resp = client.post("/api/v1/calculate", json={"items": []})
        assert resp.status_code == 422

    def test_negative_quantity_422(self, client: TestClient):
        resp = client.post("/api/v1/calculate", json={
            "items": [{"food_id": "chicken_breast_100g", "quantity": -1}],
        })
        assert resp.status_code == 422

    def test_mixed_items(self, client: TestClient):
        resp = client.post("/api/v1/calculate", json={
            "items": [
                {"food_id": "chicken_breast_100g", "quantity": 200},
                {"food_id": "whey_isolate_1_scoop", "quantity": 1},
            ],
        })
        assert resp.status_code == 200
        assert resp.json()["totals"]["protein_g"] == 85.0


class TestCalculateWithTargets:
    def test_returns_comparison(self, client: TestClient):
        resp = client.post("/api/v1/calculate/with-targets", json={
            "items": [{"food_id": "chicken_breast_100g", "quantity": 200}],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "target_comparison" in data
        assert len(data["target_comparison"]) == 4
        for entry in data["target_comparison"]:
            assert "nutrient" in entry
            assert "current" in entry
            assert "min" in entry
            assert "max" in entry
            assert "percent_of_midpoint" in entry

    def test_unknown_food_404(self, client: TestClient):
        resp = client.post("/api/v1/calculate/with-targets", json={
            "items": [{"food_id": "bad_id", "quantity": 1}],
        })
        assert resp.status_code == 404

    def test_empty_422(self, client: TestClient):
        resp = client.post("/api/v1/calculate/with-targets", json={"items": []})
        assert resp.status_code == 422
