"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CardForm from "./_components/car-form";
import { fetchCars, deleteCarById } from "@/server-actions/cars";
import { ICar } from "@/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {Spinner} from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Cars() {
  const [openCarFormDialog, setOpenCarFormDialog] = useState(false);
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [selectedCar, setSelectedCar] = useState<Partial<ICar> | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch cars on mount
  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    setError(null);
    const response: any = await fetchCars();
    if (response.success) {
      setCars(response.data || []);
    } else {
      setError(response.message);
      toast.error(response.message);
    }
    setLoading(false);
  };

  const handleAddCar = () => {
    setFormType("add");
    setSelectedCar(undefined);
    setOpenCarFormDialog(true);
  };

  const handleEditCar = (car: ICar) => {
    setSelectedCar(car);
    setFormType("edit");
    setOpenCarFormDialog(true);
  };

  const handleDeleteClick = (carId: string) => {
    setCarToDelete(carId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!carToDelete) return;

    setDeleting(true);
    const response = await deleteCarById(carToDelete);

    if (response.success) {
      toast.success(response.message);
      await loadCars();
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    } else {
      toast.error(response.message);
    }
    setDeleting(false);
  };

  const handleFormClose = () => {
    setOpenCarFormDialog(false);
    setSelectedCar(undefined);
  };

  const handleFormSuccess = async () => {
    handleFormClose();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await loadCars();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Cars</h1>
        <Button onClick={handleAddCar}>Add car</Button>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={loadCars}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="h-96">
          <Spinner />
        </div>
      )}

      {/* No Cars State */}
      {!loading && cars.length === 0 && !error && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No cars found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first car to the inventory.
            </p>
            <Button onClick={handleAddCar}>Add your first car</Button>
          </div>
        </div>
      )}

      {/* Cars Table */}
      {!loading && cars.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow className="hover:bg-gray-100">
                <TableHead className="h-12 py-3">Name</TableHead>
                <TableHead className="h-12 py-3">Company</TableHead>
                <TableHead className="h-12 py-3">Variant</TableHead>
                <TableHead className="h-12 py-3">Rent/Day</TableHead>
                <TableHead className="h-12 py-3">Status</TableHead>
                <TableHead className="h-12 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">{car.name}</TableCell>
                  <TableCell>{car.company?.toUpperCase()}</TableCell>
                  <TableCell>{car.variant?.toUpperCase()}</TableCell>
                  <TableCell>${car.rent_per_day}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        car.status === "active"
                          ? "bg-green-100 text-green-800"
                          : car.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {car.status?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCar(car)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(car.id!)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Car Form Dialog */}
      {openCarFormDialog && (
        <CardForm
          formType={formType}
          openCarFormDialog={openCarFormDialog}
          setOpenCarFormDialog={handleFormClose}
          initialData={selectedCar}
          onSuccess={handleFormSuccess}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this car? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
