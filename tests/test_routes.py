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
            assert "is_custom" in food

    def test_get_by_id(self, client: TestClient):
        resp = client.get("/api/v1/foods/chicken_breast_100g")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "chicken_breast_100g"
        assert "protein_g" in data
        assert "is_custom" in data

    def test_get_by_id_not_found(self, client: TestClient):
        resp = client.get("/api/v1/foods/nonexistent")
        assert resp.status_code == 404

    def test_categories(self, client: TestClient):
        resp = client.get("/api/v1/categories")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] > 0
        assert all("category" in c and "count" in c for c in data["categories"])

class TestFoodCRUD:
    def test_create_food(self, client: TestClient):
        resp = client.post("/api/v1/foods", json={
            "name": "My Custom Food",
            "category": "protein",
            "unit": "g",
            "reference_weight_g": 100,
            "protein_g": 25,
            "carbs_g": 5,
            "fat_g": 3,
            "calories_kcal": 150,
            "fiber_g": 0,
            "min_increment": 10,
            "notes": "Homemade",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "My Custom Food"
        assert data["is_custom"] is True
        assert data["id"].startswith("custom_")
        assert data["protein_g"] == 25

    def test_create_food_defaults(self, client: TestClient):
        resp = client.post("/api/v1/foods", json={
            "name": "Simple Food",
            "category": "carbs",
            "unit": "g",
            "reference_weight_g": 50,
            "protein_g": 5,
            "carbs_g": 20,
            "fat_g": 1,
            "calories_kcal": 110,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["fiber_g"] == 0.0
        assert data["min_increment"] == 1.0
        assert data["notes"] is None

    def test_create_food_validation(self, client: TestClient):
        resp = client.post("/api/v1/foods", json={
            "name": "",
            "category": "protein",
            "unit": "g",
            "reference_weight_g": 100,
            "protein_g": 25,
            "carbs_g": 5,
            "fat_g": 3,
            "calories_kcal": 150,
        })
        assert resp.status_code == 422

    def test_update_food(self, client: TestClient):
        resp = client.put("/api/v1/foods/custom_test_1", json={
            "name": "Updated Custom Food",
            "category": "protein",
            "unit": "g",
            "reference_weight_g": 100,
            "protein_g": 15,
            "carbs_g": 8,
            "fat_g": 3,
            "calories_kcal": 120,
            "fiber_g": 2,
            "min_increment": 10,
            "notes": "Updated notes",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Updated Custom Food"
        assert data["protein_g"] == 15

    def test_update_food_not_found(self, client: TestClient):
        resp = client.put("/api/v1/foods/nonexistent", json={
            "name": "Nope",
            "category": "protein",
            "unit": "g",
            "reference_weight_g": 100,
            "protein_g": 10,
            "carbs_g": 5,
            "fat_g": 2,
            "calories_kcal": 80,
            "fiber_g": 0,
            "min_increment": 1,
            "notes": None,
        })
        assert resp.status_code == 404

    def test_delete_food(self, client: TestClient):
        resp = client.delete("/api/v1/foods/custom_test_1")
        assert resp.status_code == 204
        resp = client.get("/api/v1/foods/custom_test_1")
        assert resp.status_code == 404

    def test_delete_food_not_found(self, client: TestClient):
        resp = client.delete("/api/v1/foods/nonexistent")
        assert resp.status_code == 404

    def test_food_appears_in_list_after_create(self, client: TestClient):
        client.post("/api/v1/foods", json={
            "name": "New Food",
            "category": "fruit",
            "unit": "each",
            "reference_weight_g": 100,
            "protein_g": 1,
            "carbs_g": 20,
            "fat_g": 0,
            "calories_kcal": 80,
        })
        resp = client.get("/api/v1/foods")
        names = [f["name"] for f in resp.json()["foods"]]
        assert "New Food" in names


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



